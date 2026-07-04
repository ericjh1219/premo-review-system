import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { customers } from "@/lib/mock-data";

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your business clients and their subscriptions"
      >
        <Button size="sm">
          <Plus className="size-4" />
          Add Customer
        </Button>
      </PageHeader>

      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-9" />
            </div>
            <p className="text-sm text-muted-foreground">
              {customers.length} customers total
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Reviews</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{customer.plan}</TableCell>
                    <TableCell className="text-right">{customer.reviews}</TableCell>
                    <TableCell className="text-right">{customer.rating}</TableCell>
                    <TableCell>
                      <StatusBadge status={customer.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer.joined}</TableCell>
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
