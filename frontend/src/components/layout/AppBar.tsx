import { useAuth } from "../../hooks/useAuth";
import Avatar from "./Avatar";
import LanguageButton from "../ui/buttons/LanguageButton";

type Props = {
    title: string;
    setSidebarOpen: () => void;
    bgColor?: string;
};

function AppBar({ title, setSidebarOpen, bgColor = "#24012B" }: Props) {
    const { user } = useAuth();

    return (
        <div>
            <header className="text-white p-4 fixed w-full top-0 z-10 flex justify-between items-center"
                style={{
                    backgroundColor: bgColor,
                    borderBottom: "0.75px solid rgba(255, 255, 255, 0.7)",
                    borderColor: "white",
                    boxShadow: "0 0 15px rgba(0, 0, 0, 0.7)",
                }}
            >
                <div className="flex items-center space-x-9">
                    <button
                        className="pl-2 cursor-pointer block text-white text-2xl"
                        onClick={setSidebarOpen}
                    >
                        ☰
                    </button>
                    <h1 className="text-xl font-bold">{title}</h1>
                </div>
                <div className="flex items-center space-x-4 pr-4">
                    <LanguageButton lang1="EN" lang2="සිං" lang3="தமி" paddingLeft="pl-2" paddingRight="pr-6" />
                    <Avatar username={user?.username ?? "Data Entry Operator"} size="md" />
                </div>
            </header>
        </div>
    )
}

export default AppBar;