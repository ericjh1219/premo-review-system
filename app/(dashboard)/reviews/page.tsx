import { Filter, Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reviews } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        title="Reviews"
        description="Monitor and manage customer reviews across all platforms"
      >
        <Button variant="outline" size="sm">
          <Filter className="size-4" />
          Filter
        </Button>
      </PageHeader>

      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Review</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="max-w-xs">
                      <div>
                        <p className="text-sm font-medium">{review.author}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{review.customer}</TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {review.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={review.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{review.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
