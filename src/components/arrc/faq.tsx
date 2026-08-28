"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchContent } from "@/lib/content-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, ArrowRight } from "lucide-react";

/* ─── Data type ─── */
type FAQItem = {
  question: string;
  answer: string;
};

/* ─── Item variants ─── */
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ─── Section ─── */
export function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  useEffect(() => {
    fetchContent()
      .then((data) => {
        if (data.faqs) {
          setFaqs(
            data.faqs.map((item: Record<string, unknown>) => ({
              question: item.title as string,
              answer: (item.content as string) || "",
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, []);

  return (
    <section id="faq" className="py-20 relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fdf9ef] via-white to-arrc-50/20" />
      {/* Decorative gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-arrc-gold/5 rounded-full blur-[120px] pointer-events-none" />
      {/* Subtle African pattern overlay */}
      <div className="african-pattern absolute inset-0 pointer-events-none opacity-[0.02]" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-arrc-gold/10 border border-arrc-gold/20 px-4 py-1.5 mb-4">
            <HelpCircle className="h-4 w-4 text-arrc-gold" />
            <span className="text-sm font-semibold text-arrc-gold font-heading">Got Questions?</span>
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-arrc-950 font-heading">
            Frequently Asked Questions
          </h2>
          <div className="mt-3 mx-auto h-1 w-20 bg-arrc-gold rounded-full" />
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Find answers to common questions about the ARRC, membership, and our mission.
          </p>
        </motion.div>

        {faqs.length > 0 ? (
          <>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="card-premium rounded-2xl overflow-hidden p-2 border-l-4 border-l-arrc-gold"
            >
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={itemVariants}
                    className={
                      i < faqs.length - 1 ? "border-b border-gray-100" : ""
                    }
                  >
                    <AccordionItem
                      value={`item-${i}`}
                      className="border-0 data-[state=open]:bg-arrc-gold/[0.03] data-[state=open]:border-l-4 data-[state=open]:border-l-arrc-gold transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left text-base font-semibold text-arrc-950 hover:no-underline hover:text-arrc-700 transition-colors px-5 py-5 [&>svg]:text-arrc-gold font-heading">
                        <span className="flex items-center gap-3">
                          <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-arrc-gold/10 text-xs font-bold text-arrc-gold font-heading">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed px-5 pb-5 pl-15">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>

            {/* CTA below FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 text-center"
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-arrc-gold hover:text-arrc-gold/80 transition-colors group"
              >
                <MessageCircle className="h-4 w-4" />
                Still have questions? Contact us
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-arrc-gold/10 animate-gold-ring-pulse">
              <HelpCircle className="h-10 w-10 text-arrc-gold" />
            </div>
            <p className="text-gray-500 text-lg font-heading">FAQ coming soon</p>
            <p className="text-gray-400 text-sm mt-1">Common questions and answers will be published here</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
