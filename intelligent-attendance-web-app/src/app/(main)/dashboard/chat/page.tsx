import Link from "next/link";

import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-medium text-sm leading-none">Xem trước Trò chuyện</h1>
          <p className="text-muted-foreground text-sm">
            Giao diện xem trước của ứng dụng Trò chuyện. Mở trong tab mới để xem toàn màn hình.
          </p>
        </div>
        <Button asChild variant="ghost" size="icon-sm">
          <Link href="/chat" target="_blank" rel="noreferrer" aria-label="Mở trò chuyện trong tab mới">
            <ExternalLink />
          </Link>
        </Button>
      </div>

      <iframe src="/chat" title="Xem trước Trò chuyện" className="min-h-0 flex-1 rounded-lg border bg-background" />
    </div>
  );
}
