import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that best fits your business needs. All plans include industry templates.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Perfect for testing the waters.</CardDescription>
            <div className="mt-4 text-4xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Up to 2 Users</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Basic CRM Modules</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> 1 Industry Template</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary shadow-lg scale-105">
          <CardHeader>
            <div className="bg-primary/10 text-primary w-fit px-3 py-1 rounded-full text-xs font-medium mb-2">Most Popular</div>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For growing teams.</CardDescription>
            <div className="mt-4 text-4xl font-bold">$49<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Up to 10 Users</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> WhatsApp Integration (1 instance)</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Custom Fields & Meta Columns</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> All Industry Templates</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Advanced Inventory & Warehouses</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Purchase Order Approval Workflows</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/sign-up?plan=pro">Start Free Trial</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>Unlimited scale.</CardDescription>
            <div className="mt-4 text-4xl font-bold">$199<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Unlimited Users</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Multiple WhatsApp Instances</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Dedicated Procurement Portal</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> Priority Support & Custom SLAs</li>
              <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary" /> White-labeling & Multi-Region</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/sign-up?plan=enterprise">Contact Sales</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
