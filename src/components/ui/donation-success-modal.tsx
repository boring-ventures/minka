import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DonationSuccessModalProps {
  open: boolean;
  onClose: () => void;
  campaignId?: string;
}

export function DonationSuccessModal({
  open,
  onClose,
  campaignId,
}: DonationSuccessModalProps) {
  const router = useRouter();

  const handleHome = () => {
    router.push("/");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#fffcf2] p-8 rounded-lg max-w-md mx-auto border-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#478C5C] hover:text-[#2c6e49]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-5">
            <Image
              src="/icons/favorite.svg"
              alt="Heart"
              width={70}
              height={70}
              className="mx-auto"
            />
          </div>

          <h2 className="text-2xl font-bold text-[#333333] mb-4">
            ¡Gracias por ser parte del cambio!
          </h2>

          <p className="text-gray-600 mb-2">
            Tu aporte ayuda a construir un futuro mejor.
          </p>

          <p className="text-gray-600 mb-8">¡Juntos somos más fuertes!</p>

          <div className="w-full border-t border-gray-200 my-4"></div>

          <Button
            onClick={handleHome}
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-10 py-3 min-w-[180px]"
          >
            Inicio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
