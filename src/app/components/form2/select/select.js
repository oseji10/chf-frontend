import { useEffect, useState } from 'react';
import selectStyles from './select.module.scss';

const Select = ({name, data, defaultValue="", searchable, onChange, disabled}) => {
    const [drop, setDrop] = useState(false)
    const [selected, setSelected] = useState('--Select--')
    const [filter, setFilter] = useState('');
    const [selectData, setSelectData] = useState([])

    const handleClick = (data) => {
        setFilter('');
        setSelected(data.label)
        setDrop(false)
        onChange(name,data.value)
    }

    useEffect(() => {
        setSelectData(data);
        if(defaultValue){
            setSelected(defaultValue);
        } 
    },[data,defaultValue])

    const handleSearchInputChange = async (e) => {
        const value = e.target.value.toLowerCase();
        return setFilter(value)
    }

    return <div className={selectStyles.select_wrapper} 
        style={{backgroundColor: `${disabled ? '#eee' : 'white'}`}}
    >
        <span 
            onClick={() => disabled ? null :  setDrop(!drop)}
        className={selectStyles.selected_item}>
            {selected}
        </span>
        {drop && <div className={selectStyles.data_wrapper}>
            {searchable && <input
                onChange={handleSearchInputChange}
                placeholder='Search item'
            />}
            <ul>
                {
                    filter ?
                    selectData.filter(
                        item => item.label.toLowerCase().includes(filter.toLocaleLowerCase())).map((data, index) => <li key={index} onClick={() => handleClick(data)}>{data.label}</li>)
                    :
                    selectData.map((data, index) => <li key={index} onClick={() => handleClick(data)}>{data.label}</li>)
                    }
            </ul>
        </div>}
    </div>
}

export default Select;