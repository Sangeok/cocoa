import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { KOLSortOption } from '@/types/kol';

const sortOptions = [
  { value: 'followers-desc', label: '팔로워 많은 순' },
  { value: 'followers-asc', label: '팔로워 적은 순' },
  { value: 'registered-desc', label: '최근 등록순' },
  { value: 'registered-asc', label: '오래된 등록순' },
] as const;

interface KOLSortSelectProps {
  value: KOLSortOption;
  onChange: (value: KOLSortOption) => void;
}

export default function KOLSortSelect({ value, onChange }: KOLSortSelectProps) {
  const selectedOption = sortOptions.find(option => option.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-48">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-100 dark:bg-gray-800 py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-white/25">
          <span className="block truncate text-gray-900 dark:text-white">
            {selectedOption?.label}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-100 dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {sortOptions.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active, selected }) =>
                  `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-gray-200 dark:bg-gray-700' : ''
                  } ${
                    selected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  }`
                }
              >
                {option.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
} 