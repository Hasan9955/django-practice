"use client";
import PageHeader from "@/components/ui/page-header";
import { useGetPlatformDataForUserSupportQuery } from "@/redux/features/banner/bannerSlice";

export default function InvestorsPage() {
  const { data } = useGetPlatformDataForUserSupportQuery({});
  const footer = data?.result?.CmsSetting?.[0]?.footer?.invertors;
  return (
    <main className="min-h-screen bg-white">
      <style jsx global>{`
        .preview-content {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          line-height: 1.7;
          color: #374151;
          font-size: 15px;
        }

        .preview-content h1 {
          font-size: 1.6rem;
          @apply font-bold mt-6 mb-4;
        }
        .preview-content h2 {
          font-size: 1.35rem;
          @apply font-bold mt-5 mb-3;
        }
        .preview-content h3 {
          font-size: 1.2rem;
          @apply font-bold mt-4 mb-2.5;
        }
        .preview-content h4,
        .preview-content h5,
        .preview-content h6 {
          font-size: 1.05rem;
          @apply font-semibold mt-4 mb-2;
        }

        .preview-content p {
          margin: 0.9rem 0;
          line-height: 1.65;
        }

        .preview-content ul,
        .preview-content ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .preview-content ul li,
        .preview-content ol li {
          margin: 0.4rem 0;
        }

        /* Mobile friendly padding */
        .product-info-collapse .ant-collapse-header {
          padding: 16px 16px !important;
          background: #fff !important;
        }
        @media (min-width: 768px) {
          .product-info-collapse .ant-collapse-header {
            padding: 20px 24px !important;
          }
        }

        .product-info-collapse .ant-collapse-content-box {
          padding: 16px 16px !important;
        }
        @media (min-width: 768px) {
          .product-info-collapse .ant-collapse-content-box {
            padding: 24px !important;
          }
        }

        .inner-faq-collapse .ant-collapse-header {
          padding: 14px 16px !important;
        }
        .inner-faq-collapse .ant-collapse-content-box {
          padding: 14px 16px !important;
        }
      `}</style>

      <PageHeader
        title="Investor Relations"
        backgroundGradient="from-blue-600 to-blue-800"
      />

      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 md:px-8">
        <div
          className="preview-content px-2 md:px-0"
          dangerouslySetInnerHTML={{
            __html: footer || "<p>No details available.</p>",
          }}
        />
      </section>
    </main>
  );
}
