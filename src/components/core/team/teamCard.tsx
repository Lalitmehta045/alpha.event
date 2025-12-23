import Image from "next/image";

interface teamProps {
  id?: number;
  image: string | any;
  name: string;
  designation: string;
}

export default function TeamCard({ id, name, image, designation }: teamProps) {
  return (
    <div
      key={id}
      className="group relative w-96 h-96 overflow-hidden rounded-2xl bg-neutral-900 text-white transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl p-3 flex flex-col justify-end col-span-1 cursor-pointer"
    >
      {/* Background Image */}
      <Image
        src={image}
        alt={`${name}.jpg`}
        width={300}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content */}
      <div className="relative flex flex-col items-start justify-start z-10 p-0 sm:p-2 md:p-2">
        <h3 className="text-lg text-left sm:text-xl md:text-3xl font-semibold mb-2">
          {name}
        </h3>
        <p className="text-gray-200 text-left font-medium text-xs sm:text-sm md:text-base leading-snug">
          {designation}
        </p>
      </div>
    </div>
  );
}
