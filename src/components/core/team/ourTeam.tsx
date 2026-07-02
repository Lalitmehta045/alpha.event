"use client";

import { motion } from "framer-motion";
import { ourteam } from "@/assets/data/ourTeam";
import TeamCard from "./teamCard";

const OurTeam = () => {
  return (
    <section className="w-full py-16 px-6 md:px-12 lg:px-24 top-10 bg-transparent">
      <div className="w-11/12 mx-auto text-center">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/50 max-w-4xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-5 text-gray-900"
          >
            Meet Our Team
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-800 text-lg max-w-3xl mx-auto"
          >
            Our passionate team of designers, coordinators, and dreamers work
            together to bring your event visions to life with precision and
            creativity.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-wrap justify-center gap-10"
        >
          {ourteam.map((i) => (
            <TeamCard
              key={i.id}
              name={i.name}
              image={i.image}
              designation={i.designation}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurTeam;
