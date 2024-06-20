import { Button, Form, Select, Slider} from 'antd';
import axios from 'axios';
import { useState } from 'react';
import {Helmet} from 'react-helmet'


const MainPage = () => {

    const defaultThreshold : number = 0.903

    const [modelType,setModelType] = useState<string>("")
    const [featureType,setFeatureType] = useState<string>("")
    const [machineType,setmachineType] = useState<string>("")
    const [machineId,setMachineId] = useState<string>("")
    const [threshold,setThreshold] = useState<string>(defaultThreshold.toString())
    const [files, setFiles] = useState<File | null>(null);

    const [isDisplayResult, setIsDisplayResult] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false);

    const [spectrogramImageResponse, setSpectrogramImageResponse] = useState<string>("");
    const [lossResponse, setLossResponse] = useState<number>(0.0);
    const [thresholdResponse, setThresholdResponse] = useState<number>(0.0);

    const handleFileUpload = (e : React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files == null)return;
        setFiles(e.target.files[0])
    }

    const handleSubmit = async() => {
        if(files == null || modelType == "" || featureType == "" || machineType == "" || machineId == "" || threshold == "" || threshold == ""){
            alert('Field cannot be empty')
            return;
        }

        setIsDisplayResult(false);
        setLoading(true);

        const form = new FormData();
        form.append('feature',featureType);
        form.append('model',modelType);
        form.append('machineType',machineType);
        form.append('machineId',machineId)
        form.append('threshold',threshold);
        form.append('files',files);

        const apiUrl = import.meta.env.VITE_API_URL;

        const response = await axios.post(`${apiUrl}/process`,form);

        setSpectrogramImageResponse(response.data.spectrogramImage);
        setLossResponse(response.data.loss);
        setThresholdResponse(response.data.threshold);

        setLoading(false);
        setIsDisplayResult(true);
    }


    return (
        <div>
            <Helmet>
                <style>{'body { background-color: #EFBC9B; }'}</style>
            </Helmet>
            <div style={{ width:'60%', minWidth:'500px', marginLeft:'auto',marginRight:'auto', marginTop:'30px', padding:'30px',borderRadius:'5px',backgroundColor:'#fbf3d5', color:'rgba(0,0,0,1)'}}>
                <h3 style={{ textAlign:'center',marginBottom:'30px'}}>Anomalous Sound Detector</h3>
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal">
                <Form.Item label="Model" style={{ marginTop:'25px',width:'500px' }}>
                    <Select onChange={(e) => setModelType(e)}>
                        <Select.Option value="unetidnn">UNet-IDNN</Select.Option>
                        <Select.Option value="idnn">AE-IDNN</Select.Option>
                        <Select.Option value="unet">UNet</Select.Option>
                        <Select.Option value="autoencoder">Autoencoder</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Feature" style={{width:'500px' }}>
                    <Select onChange={(e) => setFeatureType(e)}>
                        <Select.Option value="gammatone">Time Domain Gammatone Spectrogram</Select.Option>
                        <Select.Option value="logmel">Log Mel Spectrogram</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Machine" style={{width:'500px' }}>
                    <Select onChange={(e) => setmachineType(e)}>
                        <Select.Option value="valve">Katup</Select.Option>
                        <Select.Option value="slider">Rel</Select.Option>
                        <Select.Option value="fan">Kipas</Select.Option>
                        <Select.Option value="pump">Pompa</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Machine ID" style={{width:'500px' }}>
                    <Select onChange={(e) => setMachineId(e)}>
                        <Select.Option value="0">0</Select.Option>
                        <Select.Option value="2">2</Select.Option>
                        <Select.Option value="4">4</Select.Option>
                        <Select.Option value="6">6</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Threshold" style={{width:'500px' }}>
                    <Slider step={0.001} min={0} max={1} onChange={(e) => setThreshold(e.toString())}/>
                </Form.Item>
                <Form.Item label="Sound File" style={{width:'500px' }}>
                    <input type="file" id="wavFile" name="filename" onChange={handleFileUpload}/>
                </Form.Item>
                <Button loading={loading} type='primary' onClick={handleSubmit} style={{display:'block', marginLeft:'auto',marginRight:'auto' }}>
                    Submit
                </Button>
                </Form>
            </div>
            {
                isDisplayResult?
                <div style={{ width:'60%', minWidth:'500px', marginLeft:'auto',marginRight:'auto', marginTop:'30px', marginBottom:'30px', padding:'30px',borderRadius:'5px',backgroundColor:'#fbf3d5', color:'rgba(0,0,0,1)'}}>
                    <p>Spectrogram Result</p>
                    <img src={`data:image/png;base64,${spectrogramImageResponse}`} alt="" />
                    <p>{`Anomaly Score : ${lossResponse.toFixed(3)}`}</p>
                    {
                        lossResponse > thresholdResponse?
                        <p>Data is considered as <b>Anomaly</b> since {`${lossResponse.toFixed(3)} > ${thresholdResponse}`}</p>
                        :
                        <p>Data is considered as <b>Normal</b> since {`${lossResponse.toFixed(3)} <= ${thresholdResponse}`}</p>
                    }
                </div>
                :
                <div>

                </div>
            }
        </div>
    )
}

export default MainPage;