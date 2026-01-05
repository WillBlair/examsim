"use client";

import { useState, useEffect } from "react";
import { Sidebar, MobileHeader } from "./Sidebar";

export function SidebarWrapper() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder with the same dimensions to prevent layout shift
        return (
            <aside className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 left-0 z-[100] shrink-0 border-r border-zinc-200 bg-white overflow-hidden" />
        );
    }

    return <Sidebar />;
}

export function MobileHeaderWrapper() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder with the same dimensions
        return (
            <div className="md:hidden h-[65px] border-b border-zinc-200 bg-white sticky top-0 z-50" />
        );
    }

    return <MobileHeader />;
}
