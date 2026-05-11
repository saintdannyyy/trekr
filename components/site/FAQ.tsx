import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is Trekr really free?",
    a: "Yes. The core tracker — unlimited applications, deadlines, and pipelines — is free forever. Paid plans add team features and integrations later.",
  },
  {
    q: "Can I track things other than jobs?",
    a: "That's the point. Trekr is built for any application with stages and deadlines: jobs, internships, grad school, MBA, grants, fellowships, scholarships, accelerators, even visa or housing applications.",
  },
  {
    q: "Can I create my own stages?",
    a: "Every pipeline is fully customizable. Rename stages, add new ones, color-code them, and switch between board and list views.",
  },
  {
    q: "Will I miss a deadline?",
    a: "Trekr sends smart reminders before deadlines and surfaces what needs your attention today on a unified calendar.",
  },
  {
    q: "Is my data private?",
    a: "Your data is yours. We never sell it, never share it, and you can export everything as CSV at any time.",
  },
  {
    q: "Do you have a mobile app?",
    a: "Trekr is a fast PWA that works great on mobile today. Native apps are on the roadmap.",
  },
];

export function FAQ() {
  return (
    <Accordion type="single" collapsible className="mx-auto mt-10 max-w-3xl">
      {faqs.map((f, i) => (
        <AccordionItem key={i} value={`item-${i}`} className="border-border">
          <AccordionTrigger className="text-left font-display text-base font-semibold">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
