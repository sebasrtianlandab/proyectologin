import './ShinyText.css';

export interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className = '',
}: ShinyTextProps) {
  return (
    <span
      className={`shiny-text ${disabled ? 'shiny-text--disabled' : ''} ${className}`.trim()}
      style={{ animationDuration: `${speed}s` }}
    >
      {text}
    </span>
  );
}
