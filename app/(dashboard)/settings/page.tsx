"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account preferences and integrations"
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" defaultValue="Admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" defaultValue="User" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settingsEmail">Email</Label>
                <Input id="settingsEmail" type="email" defaultValue="admin@premo.io" />
              </div>
              <Button size="sm">Save changes</Button>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
              <CardDescription>Customize your dashboard experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Compact mode</p>
                  <p className="text-xs text-muted-foreground">
                    Use a more compact layout
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Default timezone</p>
                  <p className="text-xs text-muted-foreground">
                    Set your preferred timezone
                  </p>
                </div>
                <Select defaultValue="utc">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern (EST)</SelectItem>
                    <SelectItem value="pst">Pacific (PST)</SelectItem>
                    <SelectItem value="cet">Central European (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Notification Settings</CardTitle>
              <CardDescription>
                Choose what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "New reviews",
                  description: "Get notified when a new review is submitted",
                  defaultChecked: true,
                },
                {
                  title: "Campaign updates",
                  description: "Receive updates on campaign performance",
                  defaultChecked: true,
                },
                {
                  title: "Weekly reports",
                  description: "Get a weekly summary of your analytics",
                  defaultChecked: false,
                },
                {
                  title: "System alerts",
                  description: "Important system and security notifications",
                  defaultChecked: true,
                },
              ].map((item, i) => (
                <div key={item.title}>
                  {i > 0 && <Separator className="mb-6" />}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "Google Business", status: "Connected", connected: true },
              { name: "Facebook", status: "Connected", connected: true },
              { name: "WhatsApp Business", status: "Connected", connected: true },
              { name: "Trustpilot", status: "Not connected", connected: false },
            ].map((integration) => (
              <Card
                key={integration.name}
                className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm"
              >
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.status}</p>
                  </div>
                  <Button
                    variant={integration.connected ? "outline" : "default"}
                    size="sm"
                  >
                    {integration.connected ? "Configure" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
              <CardDescription>You are on the Pro plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight">$99</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Up to 50 customers, unlimited reviews, WhatsApp integration
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Upgrade to Enterprise</Button>
                <Button variant="outline" size="sm">
                  View invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
