import { Spacer, Spinner } from "@nextui-org/react";

export default function Loading() {
  return (
    <>
      <div className="flex flex-col align-center gap-4">
        <Spacer y={2} />
        <Spinner label="Loading..." size="lg" />
      </div>
      <div className="fixed bottom-0 overflow-hidden w-0" aria-hidden="true">
        You found an easter egg! This text is here because there is a mimimum
        chunk size required for streaming on Safari browsers. This loading screen
        does not load properly if the initial chunk is not large enough. This
        redundant text is here as a workaround to this issue.
      </div>
    </>
  );
}
