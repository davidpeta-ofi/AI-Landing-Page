import { motion } from 'framer-motion';

export default function Test({ product }: any) {
  return (
    <motion.div>
      <div className="grid grid-cols-3 gap-12 items-start">
        <div className="col-span-1">
          <motion.h3 
            className="text-4xl font-light text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            How does
            <motion.div 
              className="text-4xl font-semibold mt-2" 
              style={{ color: product.color }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {product.name}
            </motion.div>
          </motion.h3>
        </div>
      </div>
    </motion.div>
  );
}
