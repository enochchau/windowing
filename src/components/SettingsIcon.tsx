export function SettingsIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 10a2 2 0 100-4 2 2 0 000 4z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.93 6.54l-.84-.3a5.17 5.17 0 00-.31-.8l.46-.77a.75.75 0 00-.08-1.02l-.83-.83a.75.75 0 00-1.02-.08l-.77.46a5.17 5.17 0 00-.8-.31l-.3-.84a.75.75 0 00-.72-.55h-1.17a.75.75 0 00-.72.55l-.3.84a5.17 5.17 0 00-.8.31l-.77-.46a.75.75 0 00-1.02.08l-.83.83a.75.75 0 00-.08 1.02l.46.77a5.17 5.17 0 00-.31.8l-.84.3a.75.75 0 00-.55.72v1.17c0 .34.23.64.55.72l.84.3c.08.28.18.55.31.8l-.46.77a.75.75 0 00.08 1.02l.83.83c.27.27.7.3 1.02.08l.77-.46c.25.13.52.23.8.31l.3.84c.08.32.38.55.72.55h1.17c.34 0 .64-.23.72-.55l.3-.84c.28-.08.55-.18.8-.31l.77.46c.32.22.75.19 1.02-.08l.83-.83a.75.75 0 00.08-1.02l-.46-.77c.13-.25.23-.52.31-.8l.84-.3a.75.75 0 00.55-.72V7.26a.75.75 0 00-.55-.72z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
