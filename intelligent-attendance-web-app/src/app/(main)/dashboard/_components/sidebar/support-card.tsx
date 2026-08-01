import { HelpCircle } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SupportCard() {
  return (
    <Card size="sm" className="overflow-hidden shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="min-w-0 px-4">
        <CardTitle className="flex items-center gap-2 truncate text-sm font-medium">
          <HelpCircle className="size-4 text-muted-foreground" />
          Hỗ trợ hệ thống
        </CardTitle>
        <CardDescription className="line-clamp-3">
          Cần trợ giúp hoặc đóng góp ý kiến? Liên hệ với bộ phận hỗ trợ kỹ thuật để được đáp ứng nhanh nhất.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
