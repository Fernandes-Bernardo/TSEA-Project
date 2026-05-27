import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

function LoanListCard({ children }: Props) {
  return (
    <div className="bg-[#D9D9D9] rounded-2xl border-2 border-primary shadow-md overflow-hidden animate-slide-up">
      <div className="divide-y-2 divide-highlight">{children}</div>
    </div>
  );
}

export default LoanListCard;
