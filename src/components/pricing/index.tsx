import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { pricing } from '@/mock'

export default function PricingSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1>
          <p>Gemini is evolving to be more than just the models. It supports an entire to the APIs and platforms helping developers and businesses innovate.</p>
        </div>

        <div className="mx-auto mt-8 grid gap-6 md:mt-20 md:grid-cols-2 max-w-3xl">
          {
            pricing.candidates.map(el => (
              <Card key={el.plan}>
                <CardHeader>
                  <CardTitle className="font-medium">{el.plan}</CardTitle>
                  <span className="my-3 block text-2xl font-semibold">${el.price} / mo</span>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 w-full">
                    <Link href="">Get Started</Link>
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  <hr className="border-dashed" />

                  <ul className="list-outside space-y-3 text-sm">
                    {el.features.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2">
                        <Check className="size-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          }
        </div>
      </div>
    </section>
  )
}
