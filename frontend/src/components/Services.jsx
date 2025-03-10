import React from 'react';
import { Egg, Bird, ListNumbers, Package, HandPalm, Plant } from '@phosphor-icons/react';

const services = [
  {
    id: 1,
    name: "Fresh Country Eggs",
    description:
      "We produce and sell fresh, nutritious country eggs daily, ensuring the highest quality for our customers. Our eggs are sourced from healthy, well-cared-for chickens raised in a natural environment.",
    icon: Egg,
  },
  {
    id: 2,
    name: "Healthy Chicks",
    description:
      "We offer high-quality chicks hatched from our own eggs, ensuring they are healthy and ready for rearing. Our incubation process is carefully managed to provide the best start for your poultry farming needs.",
    icon: Bird,
  },
  {
    id: 3,
    name: "Custom Orders",
    description:
      "We accept custom orders for eggs and chicks, tailored to meet the specific requirements of our customers. Whether you need a small batch or bulk supply, we’ve got you covered.",
    icon: ListNumbers,
  },
  {
    id: 4,
    name: "Farm Supplies",
    description:
      "We provide essential farm supplies, including high-quality feed and supplements, to support the growth and health of your poultry. Our products are carefully selected to ensure optimal nutrition for your chickens.",
    icon: Package,
  },
  {
    id: 5,
    name: "Expert Advice",
    description:
      "With years of experience in poultry farming, we offer expert advice on raising chickens, managing feed, and ensuring the health of your flock. Our team is always ready to assist you with tips and best practices for successful poultry farming.",
    icon: HandPalm,
  },
  {
    id: 6,
    name: "Sustainable Farming Practices",
    description:
      "We are committed to sustainable farming practices that prioritize the well-being of our chickens and the environment. Our farm operates with a focus on ethical and eco-friendly methods to deliver quality products.",
    icon: Plant,
  },
];

const Services = () => {
    return (
        <div className="bg-amber-50 py-4" id="Services">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-2xl sm:text-4xl font-light mb-2"> Our {""}
                        <span className="text-2xl sm:text-4xl font-semibold mb-2">Services</span>
                    </h1>
                    <p className="text-gray-500 text-center text-balance mb-8">
                        At KTM Farm, we specialize in providing high-quality agricultural products and services to meet the needs of our local community. Here’s what we offer:
                    </p>
                </div>
                <div className="mx-auto max-w-2xl lg:max-w-4xl mb-4">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-10 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        {services.map((service) => (
                            <div key={service.name} className="relative pl-16">
                                <dt className="text-base/7 font-semibold text-gray-900">
                                    <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-amber-400">
                                        <service.icon aria-hidden="true" className="size-6 text-white" weight="duotone" />
                                    </div>
                                    {service.name}
                                </dt>
                                <dd className="mt-2 text-base/7 text-gray-600">{service.description}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default Services;
