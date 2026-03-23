import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { pricing } from '@/mock';
import { Badge } from '../ui/badge';

export default function PricingSection() {
  return (
    <section className="py-16 md:py-32" id="pricing">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            Pricing that Scales with You
          </h1>
          <p>
            Choose a plan that fits your application journey, from essential
            tools to advanced AI-assisted improvements.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-6 md:mt-20 md:grid-cols-2">
          {pricing.map((el) => (
            <Card key={el.plan}>
              <CardHeader>
                <CardTitle className="font-medium">{el.plan}</CardTitle>
                <span className="my-3 block text-2xl font-semibold">
                  ${el.price} / mo
                </span>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href="">Get Started</Link>
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <hr className="border-dashed" />

                <ul className="list-outside space-y-3 text-sm">
                  {el.features.map((feature, index) => (
                    <li key={index} className="between flex items-center gap-2">
                      <Check className="size-3 text-green-500" />
                      <span className="flex-1">{feature.label}</span>
                      {feature.upcoming && (
                        <Badge
                          variant="secondary"
                          className="text-muted-foreground text-xs"
                        >
                          Upcoming
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
