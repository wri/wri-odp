import { Button } from "../_shared/Button";

export function CTA() {
  return (
    <section className="bg-green-700">
      <div className="default-container mx-auto py-12 flex justify-between">
        <div className="flex flex-col gap-y-1">
          <h4 className="font-acumin text-2xl font-bold text-white">
            Some CTA here? Lorem ipsum dolor. Etiam porta sem malesuada magna.
          </h4>
          <h5 className="font-acumin text-xl font-normal text-gray-200">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </h5>
        </div>
        <Button>Read More</Button>
      </div>
    </section>
  );
}
