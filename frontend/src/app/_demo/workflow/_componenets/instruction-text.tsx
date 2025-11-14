export default function InstructionText({
  step,
  text,
  width,
}: {
  step: number;
  text: string;
  width: number;
}) {
  return (
    <div className={`flex w-full gap-2 py-2 text-2xl max-w-[${width}px]`}>
      <span className='font-bold'>{step}.</span>
      <span>{text}</span>
    </div>
  );
}
