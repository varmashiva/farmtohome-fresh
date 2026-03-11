const Footer = () => {
    return (
        <footer className="mt-auto pt-8 pb-4 text-center text-sm opacity-80 backdrop-blur-sm bg-black/10 border-t border-white/10">
            <div className="container mx-auto">
                <p>&copy; {new Date().getFullYear()} Farm to Home - Premium Seafood Online</p>
                <p className="mt-2 text-[11px] text-[#888] tracking-widest uppercase">
                    BUILD BY <a href="https://www.linkedin.com/in/shiva-varma-93697928a/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors pointer-events-auto font-semibold">SHIVA VARMA</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
