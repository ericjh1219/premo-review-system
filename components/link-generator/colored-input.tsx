import { cn } from "@/lib/utils";

type ColoredInputProps = {
  placeholder: string;
  accentColor: string;
  type?: string;
  defaultValue?: string;
};

export function ColoredInput({
  placeholder,
  accentColor,
  type = "text",
  defaultValue,
}: ColoredInputProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/40 bg-white/55 shadow-sm">
      <div className="flex">
        <div className={cn("w-1 shrink-0", accentColor)} />
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-[12px] text-[#1a1a1a] placeholder:text-[#1a1a1a]/45 outline-none"
        />
      </div>
    </div>
  );
}
