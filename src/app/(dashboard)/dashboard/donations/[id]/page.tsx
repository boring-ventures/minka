import { notFound } from "next/navigation";
import DonationDetails from "./donation-details";

// Define proper page params for Next.js 15
export interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DonationDetailsPage({ params }: PageProps) {
  const id = (await params).id;

  if (!id) {
    notFound();
  }

  return (
    <main>
      <DonationDetails id={id} />
    </main>
  );
}
