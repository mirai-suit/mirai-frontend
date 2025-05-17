import { title, subtitle } from "@/components/primitives";

export default function IndexPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <span className={title()}>Your&nbsp;</span>
        <span className={title({ color: "violet" })}>Futuristic&nbsp;</span>
        <br />
        <span className={title()}>project management tool for your team</span>
        <div className={subtitle({ class: "mt-4" })}>
          <p className="text-default-500">
            A simple and elegant project management tool for your team. Built
            with React, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </div>
    </section>
  );
}
