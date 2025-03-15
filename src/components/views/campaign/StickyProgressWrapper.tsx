"use client";

import { useEffect, type ReactNode } from "react";

interface StickyProgressWrapperProps {
  children: ReactNode;
}

export function StickyProgressWrapper({
  children,
}: StickyProgressWrapperProps) {
  useEffect(() => {
    const handleScroll = () => {
      const progressElement = document.getElementById("campaign-progress");
      const relatedCampaignsSection =
        document.getElementById("related-campaigns");

      if (!progressElement || !relatedCampaignsSection) return;

      const progressWrapper = document.getElementById("progress-wrapper");
      if (!progressWrapper) return;

      const relatedCampaignsTop =
        relatedCampaignsSection.getBoundingClientRect().top;
      const progressHeight = progressElement.offsetHeight;
      const windowHeight = window.innerHeight;

      // If the related campaigns section is in view, stop the sticky behavior
      if (relatedCampaignsTop < windowHeight) {
        progressWrapper.style.position = "relative";
        progressWrapper.style.top = `${relatedCampaignsTop - progressHeight - 100}px`;
      } else {
        progressWrapper.style.position = "sticky";
        progressWrapper.style.top = "20px";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div id="progress-wrapper" className="sticky top-5">
      {children}
    </div>
  );
}
