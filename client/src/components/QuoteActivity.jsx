import React, { useEffect, useState } from 'react';
import "./Table.css";
import * as XLSX from 'xlsx';

function camelize(str) {
    return str
        .split(/(?=[A-Z])/) // Split the string at every uppercase letter
        .map(word => word.toLowerCase()) // Convert each segment to lowercase
        .join('') // Join the segments back together
        .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
}

const QuoteActivity = () => {
    const [data, setData] = useState([]);
    const [counts, setCounts] = useState({});
    const [cityMapping, setCityMapping] = useState({});
    const [visitCount, setVisitCount] = useState({});
    const [stockCount, setStockCount] = useState({});
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(20000);
    const [search,setSearch] = useState("")  
    const [filteredData, setFilteredData] = useState([]);
    const [selectedFilter,setSelectedFilter]= useState('showZero')
    useEffect(() => {
        const fetchData = () => {
            fetch("http://localhost:5000/api/userdata")
                .then(response => response.json())
                .then(data => {
                    setData(data);

                    // Process quotation counts
                    const countsObj = data.result2.reduce((acc, item) => {
                        acc[item["CreatedBy"]] = (acc[item["CreatedBy"]] || 0) + 1;
                        return acc;
                    }, {});
                    setCounts(countsObj);

                    // Process visit counts
                    const visitCountsObj = data.result9.reduce((acc, item) => {
                        acc[item["CreatedBy"]] = (acc[item["CreatedBy"]] || 0) + 1;
                        return acc;
                    }, {});
                    setVisitCount(visitCountsObj);

                    // Process stock counts
                    const stockCountsObj = data.result5.reduce((acc, item) => {
                        acc[item["CreatedBy"]] = (acc[item["CreatedBy"]] || 0) + 1;
                        return acc;
                    }, {});
                    setStockCount(stockCountsObj);

                    // Process city data
                    const namesArray = data.result11.map(item => item["FormattedName"]);
                    const citiesArray = data.result11.map(item => item["City"]);
                    const cityMap = namesArray.reduce((acc, name, index) => {
                        acc[name] = citiesArray[index];
                        return acc;
                    }, {});
                    setCityMapping(cityMap);

                    setEmployees(namesArray);
                    setIsLoading(false);

                    console.log({ countsObj, visitCountsObj, stockCountsObj, cityMap });
                })
                .catch(error => console.error(error));
        };

        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    const exportToExcel = () => {
        const dataToExport = employees
            .filter((name) => {
                if (search.trim() !== '') {
                    const employeeNameLower = name.toLowerCase();
                    const employeeCityLower = cityMapping[name]?.toLowerCase() || '';
                    return employeeNameLower.includes(search.toLowerCase()) ||
                        employeeCityLower.includes(search.toLowerCase());
                }
                return true;
            })
            .map((name) => ({
                Name: camelize(name),
                City: cityMapping[name] || 'Unknown',
                'Quotation Count': counts[name] || 0,
                'Visit Count': visitCount[name] || 0,
                'Stock Transfer Count': stockCount[name] || 0,
            }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Quote Activity");

        // Exporting the file
        XLSX.writeFile(workbook, 'ChampionActivity.xlsx');
    };

    useEffect(() => {
        const filteredEmployees = employees.filter((name) => {
            const count = counts[name] || 0;
            const visitCountValue = visitCount[name] || 0;
            const stockCountValue = stockCount[name] || 0;
            const matchesSearch = search.trim() === '' || 
                    name.toLowerCase().includes(search.toLowerCase()) ||
                    (cityMapping[name] && cityMapping[name].toLowerCase().includes(search.toLowerCase()));
        
                    if (selectedFilter === 'showNonZero') {
                        return (count > 0 || visitCountValue > 0 || stockCountValue > 0) && matchesSearch;
                    }
                
                    if (selectedFilter === 'showZero') {
                        return (count === 0 && visitCountValue === 0 && stockCountValue === 0) && matchesSearch;
                    }
                
                    if (selectedFilter === 'showAll') {
                        return matchesSearch;
                    }
                
                    return false;
        });
        setFilteredData(filteredEmployees)
    },[employees, search, selectedFilter, counts, visitCount, stockCount, cityMapping])

    return (
        <div>
            <p className='records'>Total Records: {filteredData.length}</p>
            <div className='filteredcheckboxes'>
                <label>
                    <input 
                        type='checkbox'
                        checked={selectedFilter === 'showNonZero'}
                        onChange={() => setSelectedFilter('showNonZero')}
                    />
                    Show Non-Zero Counts
                </label>

                <label>
                    <input 
                        type='checkbox'
                        checked={selectedFilter === 'showZero'}
                        onChange={() => setSelectedFilter('showZero')}
                    />
                    Show Zero Counts
                </label>

                <label>
                    <input 
                        type='checkbox'
                        checked={selectedFilter === 'showAll'}
                        onChange={() => setSelectedFilter('showAll')}
                    />
                    Show All
                </label>
            </div>
            <div className='center'>
            <input type='text' placeholder='Search...' className='search' onChange={(e) => setSearch(e.target.value)}/>
            <button onClick={exportToExcel} className='excelbutton'>Export to Excel</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name of Champion</th>
                        <th>City</th>
                        <th>Quotation Count</th>
                        <th>Visit Count</th>
                        <th>Stock Transfer Count</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td className='heading' colSpan={5}>Loading...</td>
                        </tr>
                    ) : 
                        filteredData?.length > 0 ? (
                        filteredData.filter((name) => {
                            if (typeof search === 'string' && search.trim() !== '') {
                                // Safely access and convert employee.name and employee.city to lowercase
                                const employeeNameLower = name.toLowerCase();
                                const employeeCityLower = cityMapping[name]?.toLowerCase();
                                // Filter employees whose name or city matches the search term
                                return employeeNameLower.includes(search.toLowerCase()) ||
                                    employeeCityLower.includes(search.toLowerCase());
                            }
                            // If search term is empty or not a string, return all employees
                            return true;
                        }).map((name, index) => {
                            const count = counts[name] || 0;
                            const visitCountValue = visitCount[name] || 0;
                            const stockCountValue = stockCount[name] || 0;
                            const city = cityMapping[name] || 'Unknown';
                                return (
                                    <tr key={index}>
                                        <td>{camelize(name)}</td>
                                        <td>{city}</td>
                                        <td>{count}</td>
                                        <td>{visitCountValue}</td>
                                        <td>{stockCountValue}</td>
                                    </tr>
                                );
                            
                        })
                    ) : (
                        <tr>
                            <td className="heading" colSpan={5}>
                                Nothing is here.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default QuoteActivity;
