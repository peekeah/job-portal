
function DynamicInput({ inputArr, addInput, removeInput, handleChange }) {

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {
                inputArr.map((_, id) => (
                    <div>
                        <input type="text" value={inputArr[id]} name={id} onChange={handleChange} />
                        <span>
                            <button name={id} onClick={addInput}>+</button>
                            <button name={id} onClick={removeInput} disabled={inputArr.length <=1 ? 1 : 0}>-</button>
                        </span>
                    </div>
                ))
            }
        </div>
    )
}

export default DynamicInput