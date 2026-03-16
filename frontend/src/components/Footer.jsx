const Footer = () => {
    return (
        <footer className="w-full mt-auto py-6 flex items-center justify-center text-center text-[13px] opacity-80 backdrop-blur-sm bg-black/10 border-t border-white/10">
            <div className="container mx-auto px-4 tracking-wide flex flex-col items-center gap-2">
                <p>&copy; {new Date().getFullYear()} Farm to Home</p>
                <div className="py-1 px-3 border border-white/10 rounded bg-white/5 inline-block">
                    <p className="text-[10px] md:text-[11px] text-white/70 tracking-[0.1em] uppercase font-bold">
                        📍 Services currently available only to selected communities in LB Nagar
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
