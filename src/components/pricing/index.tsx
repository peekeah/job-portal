import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { pricing } from '@/mock';
import { Badge } from '../ui/badge';
import { IconX } from '@tabler/icons-react';

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
            <Card
              key={el.plan}
              className="transition-all hover:scale-101 hover:shadow-2xl"
            >
              <CardContent className="space-y-4">
                <CardTitle className="mb-2 font-bold">{el.plan}</CardTitle>
                <span className="text-primary mb-3 block text-2xl font-semibold">
                  ${el.price} / mo
                </span>
                <hr className="border-dashed" />
                <ul className="list-outside space-y-3 text-sm">
                  {el.features.map((feature, index) => (
                    <li key={index} className="between flex items-center gap-2">
                      {!feature.upcoming ? (
                        <Check className="size-3 text-green-500" />
                      ) : (
                        <IconX className="text-destructive size-3" />
                      )}
                      <span className="flex-1">{feature.label}</span>
                      {feature.upcoming && (
                        <Badge
                          variant="secondary"
                          className="inline-flex items-center gap-1.5 rounded-full border text-xs font-medium"
                          style={{
                            background: '#E1F5EE',
                            color: '#085041',
                            borderColor: '#1D9E75',
                          }}
                        >
                          <span className="size-1.5 rounded-full bg-[#1D9E75]" />
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
