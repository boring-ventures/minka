"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignStatus } from "./campaign-card"; // Reusing status type
import { ProfileData } from "@/types"; // Assuming ProfileData is in types
import { toast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation"; // For refreshing data
import { CheckCircle, Pencil, ExternalLink } from "lucide-react";

// Reusing FormattedCampaign definition structure from the page
interface FormattedCampaign {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  location: string;
  raisedAmount: number;
  goalAmount: number;
  progress: number;
  status: CampaignStatus;
  description: string;
  isVerified: boolean;
  organizerName?: string;
  organizerEmail?: string;
}

interface AdminCampaignTableProps {
  campaigns: FormattedCampaign[];
}

export function AdminCampaignTable({ campaigns }: AdminCampaignTableProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerifyCampaign = async (campaignId: string) => {
    setVerifyingId(campaignId);
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ verification_status: true })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaign Verified",
        description: "The campaign has been successfully verified.",
      });
      // Refresh the page data to show updated status
      router.refresh();
    } catch (error: any) {
      console.error("Error verifying campaign:", error);
      toast({
        title: "Verification Failed",
        description:
          error.message || "Could not verify the campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Organizer</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Verified</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-muted-foreground"
            >
              No campaigns found.
            </TableCell>
          </TableRow>
        ) : (
          campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.title}</TableCell>
              <TableCell>
                {campaign.organizerName || "N/A"} (
                {campaign.organizerEmail || "N/A"})
              </TableCell>
              <TableCell>{campaign.category}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    campaign.status === "active" ? "default" : "secondary"
                  }
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {campaign.isVerified ? (
                  <Badge variant="success">Yes</Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {!campaign.isVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerifyCampaign(campaign.id)}
                    disabled={verifyingId === campaign.id}
                  >
                    {verifyingId === campaign.id ? (
                      "Verifying..."
                    ) : (
                      <>
                        <CheckCircle className="mr-1 h-4 w-4" /> Verify
                      </>
                    )}
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/campaigns/${campaign.id}`}>
                    <Pencil className="mr-1 h-4 w-4" /> Edit
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  {/* Assuming a public campaign page exists at /campaigns/:id */}
                  <Link href={`/campaigns/${campaign.id}`} target="_blank">
                    <ExternalLink className="mr-1 h-4 w-4" /> View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

// Add custom variant for success badge if not already defined globally
// You might need to add this to your Badge component's variants
// Example:
// success: "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80",
