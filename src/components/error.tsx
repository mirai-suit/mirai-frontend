// import { useIllustration } from "@/libs/hooks/useIllustration";

export default function ErrorPage() {
  //   const errorIllustration = useIllustration("error");
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <img
        src={""}
        alt="not found illustration"
        className="size-44 rounded-lg object-cover"
      />
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="text-default-500 text-base">
        We're working on fixing this issue.
      </p>
    </div>
  );
}
