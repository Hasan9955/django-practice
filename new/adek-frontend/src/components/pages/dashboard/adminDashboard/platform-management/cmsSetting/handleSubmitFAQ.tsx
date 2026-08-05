/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import Card from "antd/es/card/Card";
import { Input, message, Skeleton, Spin } from "antd";
import { toast } from "sonner";
import { LoadingOutlined } from "@ant-design/icons";

import {
  useCreateOrUpdateFaqMutation,
  useGetPlatformDataQuery,
  useDeleteFaqMutation,
} from "@/redux/features/dashborad/platform/platformManagementApi";

interface FAQItem {
  id?: string; // Optional for new FAQs
  question: string;
  answer: string;
}

const FAQSection = () => {
  const { data: platformData, isLoading: isPlatformDataLoading } =
    useGetPlatformDataQuery({});

  const cmsSettingId = platformData?.result?.CmsSetting?.[0]?.id;
  const faqData = platformData?.result?.CmsSetting?.[0]?.faq;

  const [faqs, setFaqs] = useState<FAQItem[]>([{ question: "", answer: "" }]);

  const [submitFaq, { isLoading: isFaqLoading }] =
    useCreateOrUpdateFaqMutation();

  const [deleteFaq] = useDeleteFaqMutation();
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null);

  // Load existing FAQs from backend
  useEffect(() => {
    if (faqData && faqData.length > 0) {
      setFaqs(
        faqData.map((faq: any) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        })),
      );
    }
  }, [faqData]);

  // Add new FAQ
  const addFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  // Remove FAQ locally
  const removeFAQ = (index: number) => {
    if (faqs.length > 1) {
      setFaqs(faqs.filter((_, i) => i !== index));
    }
  };

  // Delete FAQ from backend
  const handleDeleteFaq = async (faqId: string, index: number) => {
    try {
      setDeletingFaqId(faqId); // ← set before request
      await deleteFaq(faqId).unwrap();
      setFaqs(faqs.filter((_, i) => i !== index));
      toast.success("FAQ deleted successfully!");
    } catch (error: any) {
      console.error("Delete FAQ error:", error);
      toast.error(error?.data?.message || "Failed to delete FAQ");
    } finally {
      setDeletingFaqId(null); // ← always clear after
    }
  };

  // Update FAQ field
  const updateFAQ = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  // Submit FAQs to backend
  const handleSubmitFAQ = async () => {
    try {
      const filteredFaqs = faqs.filter(
        (faq) => faq.question.trim() !== "" || faq.answer.trim() !== "",
      );

      if (!cmsSettingId) {
        message.error("CMS Setting ID not found");
        return;
      }

      if (filteredFaqs.length === 0) {
        message.warning("Please add at least one FAQ with question and answer");
        return;
      }

      const payload = {
        cmsSettingId,
        faqs: filteredFaqs,
      };

      const response = await submitFaq(payload).unwrap();

      toast.success("FAQ section updated successfully!");
      console.log("FAQ Response:", response);
    } catch (error: any) {
      console.error("FAQ submission error:", error);
      toast.error(error?.data?.message || "Failed to update FAQ section");
    }
  };

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className="text-color-1c font-inter text-2xl font-medium mb-3">
          FAQ
        </h2>
        <p className="text-[#5F6368] font-inter text-base font-normal">
          Add new questions and answers
        </p>
      </div>

      <Card className="bg-gray-50 border-gray-200 mb-6">
        {isPlatformDataLoading ? (
          <Skeleton active />
        ) : (
          <div>
            {faqs.map((faq, index) => (
              <div key={faq.id || index} className="space-y-4">
                {/* Question */}
                <div className="relative">
                  <label className="text-color-1c font-nunito text-xl font-semibold">
                    Question
                  </label>
                  <div className="relative w-full mt-3">
                    <Input
                      placeholder="Enter question"
                      value={faq.question}
                      onChange={(e) =>
                        updateFAQ(index, "question", e.target.value)
                      }
                      className="pr-10 custom-input-container w-full custom-input"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                      {faq.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFaq(faq.id!, index)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-700"
                          disabled={deletingFaqId === faq.id} // ← disable only this button
                        >
                          {deletingFaqId === faq.id ? ( // ← check specific ID
                            <Spin indicator={<LoadingOutlined spin />} />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      {faqs.length > 1 && !faq.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFAQ(index)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer */}
                <div className="relative">
                  <label className="text-color-1c font-nunito text-xl font-semibold">
                    Answer
                  </label>
                  <div className="relative mt-3 w-full">
                    <textarea
                      placeholder="Enter answer"
                      value={faq.answer}
                      onChange={(e) =>
                        updateFAQ(index, "answer", e.target.value)
                      }
                      className="pr-10 w-full min-h-[80px] outline-none custom-input-container custom-input"
                    />
                  </div>
                </div>

                {index < faqs.length - 1 && <hr className="border-gray-200" />}
              </div>
            ))}

            <div className="flex justify-between items-center mt-6">
              <Button
                variant="link"
                onClick={addFAQ}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add new question
              </Button>
              <Button
                onClick={handleSubmitFAQ}
                className="bg-blue-600 text-white rounded-full hover:bg-blue-700"
                disabled={isFaqLoading || isPlatformDataLoading}
              >
                {isFaqLoading ? "Submitting..." : "Submit FAQ"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FAQSection;
