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
    <div className={`flex py-2 gap-2 text-2xl w-full max-w-[${width}px]`}>
      <span className='font-bold'>{step}.</span>
      <span>{text}</span>
    </div>
  );
}
