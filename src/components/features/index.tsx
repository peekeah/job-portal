import { features } from '@/mock';



const Features = () => {
  return (
    <section className="py-12 md:py-20" id="features">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-4xl font-medium text-balance lg:text-5xl">
            Features
          </h2>
          <p>
            From finding roles to improving resume quality before submission,
            Nexthire is designed for candidates who want a cleaner and more
            intentional application workflow.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-9 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((el) => (
            <div key={el.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <el.icon className="text-primary" />
                <h3 className="text-sm font-medium">{el.title}</h3>
              </div>
              <p className="text-sm">{el.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
