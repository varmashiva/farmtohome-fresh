import re

with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/HomeScreen.jsx', 'r') as f:
    text = f.read()

# 1. FRESH CATCH OF THE DAY
old_fresh_catch = """                            <div className="w-full md:w-[80%] lg:w-[75%] flex flex-col items-start">
                                <h2 id="products" className="text-[50px] md:text-[80px] lg:text-[110px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                                    FRESH CATCH<br />
                                    OF THE DAY
                                </h2>
                            </div>"""

new_fresh_catch = """                            <div className="w-full md:w-[80%] lg:w-[75%] flex flex-col items-start overflow-hidden pt-4 -mt-4">
                                <motion.h2 
                                    initial="hidden" 
                                    whileInView="visible" 
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                                    id="products" className="text-[50px] md:text-[80px] lg:text-[110px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase flex flex-col" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                                    <div className="overflow-hidden pb-2 -mb-2"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">FRESH CATCH</motion.span></div>
                                    <div className="overflow-hidden pb-2 -mb-2"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">OF THE DAY</motion.span></div>
                                </motion.h2>
                            </div>"""

text = text.replace(old_fresh_catch, new_fresh_catch)


# 2. PREMIUM SELECTION
old_premium = """                        <div className="w-full md:w-3/4 text-left">
                            <h2 className="text-[11vw] md:text-[7.2vw] font-bold leading-[0.85] tracking-tighter uppercase drop-shadow-lg text-white">
                                PREMIUM
                                <br />
                                SELECTION
                            </h2>
                        </div>"""

new_premium = """                        <div className="w-full md:w-3/4 text-left overflow-hidden pt-4 -mt-4">
                            <motion.h2 
                                initial="hidden" 
                                whileInView="visible" 
                                viewport={{ once: true, margin: "-50px" }}
                                variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                                className="text-[11vw] md:text-[7.2vw] font-bold leading-[0.85] tracking-tighter uppercase drop-shadow-lg text-white flex flex-col">
                                <div className="overflow-hidden pb-2 -mb-2"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">PREMIUM</motion.span></div>
                                <div className="overflow-hidden pb-2 -mb-2"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">SELECTION</motion.span></div>
                            </motion.h2>
                        </div>"""

text = text.replace(old_premium, new_premium)


# 3. NEED ANSWER
old_need_answer = """                        <div className="w-full md:w-3/4 text-left">
                            <h2 className="text-[50px] md:text-[80px] lg:text-[110px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                                NEED
                                <br />
                                ANSWER
                            </h2>
                        </div>"""

new_need_answer = """                        <div className="w-full md:w-3/4 text-left overflow-hidden pt-4 -mt-4">
                            <motion.h2 
                                initial="hidden" 
                                whileInView="visible" 
                                viewport={{ once: true, margin: "-50px" }}
                                variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                                className="text-[50px] md:text-[80px] lg:text-[110px] font-black leading-[0.85] tracking-tighter text-[#eaeaea] uppercase flex flex-col" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900 }}>
                                <div className="overflow-hidden pb-4 -mb-4"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">NEED</motion.span></div>
                                <div className="overflow-hidden pb-4 -mb-4"><motion.span variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(8px)" }, visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }} className="block origin-bottom-left">ANSWER</motion.span></div>
                            </motion.h2>
                        </div>"""

text = text.replace(old_need_answer, new_need_answer)

with open('/Users/shivavarma/Fresh_prown/Fresh_prowns/frontend/src/screens/HomeScreen.jsx', 'w') as f:
    f.write(text)
print("Updated all 3 headings successfully!")
