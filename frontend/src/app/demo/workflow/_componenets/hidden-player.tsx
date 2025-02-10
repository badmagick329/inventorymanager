import { Button } from "@heroui/react";

export default function HiddenPlayer({
  width,
  callback,
}: {
  width: number;
  callback: () => void;
}) {
  return (
    <div className={`max-w-[${width}px] mx-2 rounded-md px-4 py-2`}>
      <Button color='default' variant='bordered' radius='sm' onPress={callback}>
        Show Video
      </Button>
    </div>
  );
}
