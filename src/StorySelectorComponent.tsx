import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useEffect, useState } from "react";
import { Story, storyIDs } from "./Story";

interface DropdownOption {
    name: string;
    code: string;
}

export interface StorySelectorComponentProps {
    onStoryChange: (story: Story) => void;
}

const StorySelectorComponent = (props: StorySelectorComponentProps) => {

    const [selectedDropdownOption, setSelectedDropdownOption] = useState<DropdownOption>();
    const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);

    useEffect(() => {
        const storyObjects = getStoryObjects(storyIDs);
        const dropdownOptions = generateDropdownOptions(storyIDs);
        setDropdownOptions(dropdownOptions);
    }, []);

    useEffect(() => {
        if (selectedDropdownOption) {
            const story = new Story(selectedDropdownOption.code);
            props.onStoryChange(story);
        }
    }, [selectedDropdownOption]);

    const getStoryObjects = (storyNames: string[]) => {
        const storyObjects = storyNames.map(storyName => {
            return new Story(storyName);
        });
        return storyObjects;
    }

    const generateDropdownOptions = (storyNames: string[]): DropdownOption[] => {
        const dropdownOptions = storyNames.map(storyName => {
            const stringWithSpaces = storyName.replace(/_/g, ' ');
            const name = stringWithSpaces.charAt(0).toUpperCase() + stringWithSpaces.slice(1);
            return { name, code: storyName } as DropdownOption;
        });
        return dropdownOptions;
    }

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setSelectedDropdownOption(e.value);
    }

    return (
        <div className="p-float-label">
            <Dropdown
                inputId={"storySelectorDropdown"}
                value={selectedDropdownOption}
                onChange={(e) => handleDropdownChange(e)}
                options={dropdownOptions}
                optionLabel="name"
                style={{display: "flex", width: "200px"}}
                className="w-full md:w-14rem">

            </Dropdown>
            <label htmlFor="storySelectorDropdown">Current Story</label>
        </div>
    );

}

export default StorySelectorComponent;
