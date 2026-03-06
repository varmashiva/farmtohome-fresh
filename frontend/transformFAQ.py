with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/HomeScreen.jsx', 'r') as f:
    text = f.read()

import_replacement = """import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';"""

text = text.replace("import React, { useEffect, useState, useContext } from 'react';", import_replacement)

# We need to add state for tracking the open FAQ index.
# Let's find: const [videoOpacity, setVideoOpacity] = useState(1);
# and add our state right after it.

state_target = "const [videoOpacity, setVideoOpacity] = useState(1);"
state_replacement = "const [videoOpacity, setVideoOpacity] = useState(1);\n    const [openFaqIndex, setOpenFaqIndex] = useState(null);"
text = text.replace(state_target, state_replacement)

# Now, we replace the FAQ mapping section
old_faq_map = """                                {[
                                    "What type of clients do you work with?",
                                    "Do you offer full-service production?",
                                    "Can we book just one service, like photography or editing?",
                                    "How far in advance should we book?",
                                    "Do you work internationally?",
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center py-5 md:py-6 px-5 md:px-8 bg-[#111111] rounded-[4px] group cursor-pointer hover:bg-[#181818] transition-colors duration-300 w-full"
                                    >
                                        <span className="text-[14px] md:text-[16px] font-[500] text-white/80" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {item}
                                        </span>
                                        <span className="text-[20px] font-light text-white/60 leading-none">
                                            +
                                        </span>
                                    </div>
                                ))}"""

new_faq_map = """                                {[
                                    { question: "What type of clients do you work with?", answer: "We collaborate with brands, artists, agencies, and publications across fashion, lifestyle, music, and culture. Whether emerging or established, we align best with those who value visual impact and creative direction." },
                                    { question: "Do you offer full-service production?", answer: "Yes, we handle everything from creative conceptualization and location scouting to talent casting, photography, video production, and post-production editing." },
                                    { question: "Can we book just one service, like photography or editing?", answer: "Absolutely. While we excel at end-to-end production, our customized service packages allow you to select individual creative services tailored to your specific needs." },
                                    { question: "How far in advance should we book?", answer: "We recommend reaching out at least 4 to 6 weeks in advance to ensure availability and allow sufficient time for proper pre-production planning." },
                                    { question: "Do you work internationally?", answer: "Yes, our team is available for travel and has extensive experience executing flawless remote productions and campaigns globally." },
                                ].map((item, index) => {
                                    const isOpen = openFaqIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                            className="flex flex-col bg-[#111111] rounded-[4px] group cursor-pointer hover:bg-[#181818] transition-colors duration-300 w-full overflow-hidden"
                                        >
                                            <div className="flex justify-between items-center py-5 md:py-6 px-5 md:px-8">
                                                <span className="text-[14px] md:text-[16px] font-[500] text-white/80" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {item.question}
                                                </span>
                                                <motion.span
                                                    animate={{ rotate: isOpen ? 45 : 0 }}
                                                    transition={{ duration: 0.3, ease: 'backOut' }}
                                                    className="text-[20px] font-light text-white/60 leading-none origin-center"
                                                >
                                                    +
                                                </motion.span>
                                            </div>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        className="px-5 md:px-8"
                                                    >
                                                        <div className="pb-6 md:pb-8 pt-2">
                                                            <p className="text-[14px] md:text-[15px] text-[#999] font-[400] leading-[1.7] max-w-[90%]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                                {item.answer}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}"""

text = text.replace(old_faq_map, new_faq_map)

with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/HomeScreen.jsx', 'w') as f:
    f.write(text)
print("Updated FAQ component locally!")
