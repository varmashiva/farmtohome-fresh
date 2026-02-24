const Footer = () => {
    return (
        <footer className="mt-auto py-8 text-center text-sm opacity-80 backdrop-blur-sm bg-black/10 border-t border-white/10">
            <div className="container mx-auto">
                <p>&copy; {new Date().getFullYear()} Fresh Prawns - Premium Seafood Online</p>
            </div>
        </footer>
    );
};

export default Footer;
