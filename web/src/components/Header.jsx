import Icon from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';
import { useAuth } from '../hooks/useAuth';

export function Header() {
    const { user } = useAuth();
    
    if (!user || !user.name) {
        return null;
    }
    
    return (
        <header className="flex justify-end w-full bg-primary h-16">
            <div className="flex items-center cursor-pointer transition-all p-2 hover:bg-[rgba(0,0,0,0.2)] hover:transition-all mr-4 rounded-md">
                <div className="text-right mr-3">
                    <span className="block m-0 p-0 text-white mb-[-10px]">
                        { user?.name || '' }
                    </span>
                    <small className="block mt-1 text-white">Plano Gold</small>
                </div>
                <img src={user?.avatar || ''} alt="" className="w-[50px] rounded-full"/>
                <Icon path={mdiChevronDown} size={1} className="ml-2 text-white"/>
            </div>
        </header>
    );
}