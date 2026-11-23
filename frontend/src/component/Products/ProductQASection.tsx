import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../../server";
import { IProductQA } from "../../types";
import {
  BsQuestionCircle,
  BsHandThumbsUp,
  BsShieldCheck,
  BsShop,
} from "react-icons/bs";

export interface ProductQASectionProps {
  productId: string;
  artisanShopName?: string;
}

const ProductQASection: React.FC<ProductQASectionProps> = ({
  productId,
  artisanShopName = "Artisan Workshop",
}) => {
  const [questions, setQuestions] = useState<IProductQA[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showAskForm, setShowAskForm] = useState<boolean>(false);

  const fetchQA = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${server}/qa/product/${productId}`);
      if (res.data?.success) {
        setQuestions(res.data.questions || []);
      }
    } catch (err: any) {
      console.error("Failed to load Q&A", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchQA();
  }, [productId]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      toast.error("Please enter your question");
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${server}/qa/ask`,
        { productId, question: newQuestion },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Question submitted!");
      setNewQuestion("");
      setShowAskForm(false);
      fetchQA();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Please sign in to ask a question"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (qId: string) => {
    try {
      const res = await axios.put(`${server}/qa/helpful/${qId}`);
      if (res.data?.success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q._id === qId ? { ...q, helpfulVotes: res.data.helpfulVotes } : q
          )
        );
      }
    } catch (err) {
      // non-blocking
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/80">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <BsQuestionCircle className="text-amber-800" />
            <span>Questions & Answers ({questions.length})</span>
          </h3>
          <p className="text-xs text-stone-500">
            Have a question about the Shemma weave, cotton softness, or tailoring fit? Ask the artisan directly.
          </p>
        </div>

        <button
          onClick={() => setShowAskForm(!showAskForm)}
          className="px-4 py-2 bg-stone-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
        >
          {showAskForm ? "Cancel" : "Ask a Question"}
        </button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <form
          onSubmit={handleAskQuestion}
          className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3 animate-fadeIn"
        >
          <label className="text-xs font-bold uppercase text-stone-700 block">
            Your Question for {artisanShopName}
          </label>
          <textarea
            rows={3}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="e.g. Does the gold Tibeb embroidery tarnish when washed? Can the hem length be customized for 170cm height?"
            className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-amber-600 transition"
          />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:bg-stone-300"
            >
              {submitting ? "Submitting..." : "Post Question"}
            </button>
          </div>
        </form>
      )}

      {/* Questions Feed */}
      {loading ? (
        <div className="py-8 text-center text-xs text-stone-400">
          Loading questions & answers...
        </div>
      ) : questions.length === 0 ? (
        <div className="py-10 text-center bg-stone-50 rounded-2xl border border-stone-200/60 p-6">
          <p className="text-xs font-bold text-stone-700">No questions asked yet about this craft.</p>
          <p className="text-[11px] text-stone-400 mt-1">
            Be the first to ask! The artisan workshop usually responds within 24 hours.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q._id}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/70 shadow-xs space-y-3"
            >
              {/* Question Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    Q
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-stone-900">
                      {q.question}
                    </p>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">
                      Asked by {q.userName} ·{" "}
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Helpful Upvote Button */}
                <button
                  onClick={() => handleHelpful(q._id)}
                  className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-amber-800 font-medium px-2 py-1 rounded-lg hover:bg-stone-50 transition border border-stone-200/50 shrink-0"
                  title="Mark as helpful"
                >
                  <BsHandThumbsUp className="text-xs" />
                  <span>{q.helpfulVotes || 0}</span>
                </button>
              </div>

              {/* Answers */}
              {q.answers && q.answers.length > 0 ? (
                <div className="pl-7 space-y-2 pt-2 border-t border-stone-100">
                  {q.answers.map((ans, aIdx) => (
                    <div
                      key={aIdx}
                      className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/40 text-xs text-stone-800 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px]">
                        <BsShop className="text-amber-800 text-[10px]" />
                        <span>{ans.responderName}</span>
                        {ans.isVerifiedSeller && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300">
                            <BsShieldCheck className="text-[10px]" /> Verified Artisan
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 font-normal ml-auto">
                          {new Date(ans.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-stone-700 leading-relaxed pl-4">
                        {ans.answer}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pl-7 text-[11px] text-amber-700/80 italic">
                  ⏳ Awaiting response from {artisanShopName}...
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductQASection;
