type MapPlaceholderProps = {
  text: string;
  error?: boolean;
};

export default function MapPlaceholder({ text, error = false }: MapPlaceholderProps) {
  return (
    <div
      style={{ height: 420 }}
      className={`flex items-center justify-center text-sm ${error ? "text-red-600" : "text-slate-600"}`}
    >
      {text}
    </div>
  );
}