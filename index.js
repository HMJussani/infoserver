/**
 * Infoserver - Serial   09/03/2023
 * Implemento contador de char
 * Mostra drives / partiçoes
 */

const SerialPort = require('serialport');
const os = require('os');
let path = 'COM3';
let osSys = os.platform();
if(osSys==='linux') path = '/dev/ttyUSB1';
const si = require('systeminformation');
    
const port = new SerialPort(path, {baudRate: 115200 });

const mentot = (((os.totalmem()/1024/1024)/1024)).toFixed(2);
let cont = 0;
let drives = 0;
let linha1, linha2;

function contaChar(frase1,frase2){
    while(frase1.length<16){        
        frase1 += " ";
    }
   // if(frase1>=16)frase1= frase1.substring(0,16);
    frase1 += frase2;
    console.log(frase1);
    return frase1;
}

function data(){
  const time = new Date();
  let mes = time.getMonth()+1;
  let dia = time.getDate();
  if(mes<10)mes='0'+mes;
  if(dia<10)dia='0'+dia;
  const data = dia+'/'+mes+'/'+time.getFullYear();
  return data;
}

function hora(){
  const time = new Date();
  let hora = time.getHours();
  let min = time.getMinutes();
  let seg = time.getSeconds();
  if(hora<10) hora = '0'+hora;
  if(min<10) min = '0'+min;
  if(seg<10) seg = '0'+seg;
  const horario = hora+':'+min+':'+seg;
  return horario;
}

setInterval(getdata, 500*10);

function getCpu(){   
    const cpu = os.cpus(); 
    return cpu[0].model.split(' ');
}

function teste(){
    
  console.log((si.time().uptime)/60/60)/24;
  
}

function getdata(){
   
    const freemen = (((os.freemem()/1024/1024)/1024)).toFixed(2);
    const cpu = getCpu();
    switch (cont){
        case 0:{                     
           linha1 = (`CPU:${os.cpus().length}X ${cpu[0]}`);
           if(osSys==='linux'){
           linha2 = (`${cpu[1]} ${cpu[3]}`);
            }else{
           linha2 = (`${cpu[1]} ${cpu[2]}`);
           }
          port.write( contaChar(linha1, linha2));
         cont++; 
          //teste();
           break;
        }
        case 1:{
           //port.write(`RAM   ${mentot}GbRAM Free: ${((freemen/mentot)*100).toFixed(2)}%`);
           linha1 = (`RAM: ${mentot} Gb`);
           linha2 = (`RAM Free: ${((freemen/mentot)*100).toFixed(2)}%`);
           port.write( contaChar(linha1, linha2));
            cont++;
            break;
        }
        case 2:{
           si.fullLoad() 
             .then(data => {
               linha1 = (`CPU Load: ${data.toFixed(2) + "%"}`);
               linha2 = (`RAM Free: ${((freemen/mentot)*100).toFixed(2)}%`);
               //port.write(`CPU Load: ${data.toFixed(2) + "%"}`);
               port.write( contaChar(linha1, linha2));
            })
            .catch(error => console.error(error));
            cont++;
            break;
        }
       
        case 3:{
            si.diskLayout()           
            .then(data => {
                linha1 = (`Disk(s) Found: ${drives+1}`);
                linha2 = (`${data[drives].name}`);
                //port.write(`Disk Type: ${data[drives].type}  ${data[drives].name} `); 
                port.write( contaChar(linha1, linha2));
                
            })
            .catch(error => console.error(error));           
            cont++;
            break;
        }        
        case 4:{
            si.diskLayout()           
            .then(data => {
                linha1 = (`Disk Type: ${data[drives].type}`);
                linha2 = (`${data[drives].name} `);
                //port.write(`Disk Type: ${data[drives].type}  ${data[drives].name} `); 
                port.write( contaChar(linha1, linha2));
                
            })
            .catch(error => console.error(error));           
            cont++;
            break;
        }        
        case 5:{
            si.diskLayout()           
            .then(data => {
                linha1 = (`Size: ${(data[drives].size/1000/1000/1000).toFixed(2)+ " GB"}`);
                if(osSys==='linux'){
                    linha2 = (`${data[drives].vendor}`);;
                     }else{
                        linha2 = (`Disk Status: ${data[drives].smartStatus}`);
                    }
                //port.write(`Size: ${(data[drives].size/1000/1000/1000).toFixed(2)+ " GB"} Disk Status: ${data[drives].smartStatus}`);
                port.write( contaChar(linha1, linha2));
            })
            .catch(error => console.error(error));
            cont++;
            break;
        }
        case 6:{
            si.fsSize()           
            .then(data => {
                switch(drives){
                    case 0:{
                        linha1 = (`Disk: ${data[0].mount}`);
                        break;
                    }
                    case 1:{
                        linha1 = (`Disk: ${data[6].mount}`);
                        break;
                    }
                    case 2:{
                        linha1 = (`Disk: ${data[5].mount}`);
                        break;
                    }
                }
                linha2 = (`Free: ${(100-data[drives].use).toFixed(2)+"%"}`)
                //port.write(`Disk: ${data[drives].mount}        Free: ${(100-data[drives].use).toFixed(2)+"%"}`);
                port.write( contaChar(linha1, linha2));
            })
            .catch(error => console.error(error)); 
            cont++;
            break;
        }
        case 7:{
            //port.write(`Sys: ${os.platform()}-${os.arch()}  OS:  ${os.type()}`);
            linha1 = (`Sys: ${os.platform()}-${os.arch()}`);
            linha2 = (`OS:  ${os.type()}`);   
            drives++;             
            port.write( contaChar(linha1, linha2)); 
            si.diskLayout()           
            .then(data => {
               if(drives >= data.length){
                drives = 0; 
             }               
            }).catch(error => console.error(error));        
            cont++; 
            break;
         }
        case 8:{
            const upTime = ((si.time().uptime)/60)/60;
            if (upTime <=24) {
               linha1 = (`    UpTime:     `);
               linha2 = (`    ${upTime.toFixed(2)} Hrs`);
               port.write( contaChar(linha1, linha2));
            }
            if (upTime >=24) {
                linha1 = (`    UpTime:     `);
                linha2 = (`    ${(upTime/24).toFixed(2)} Dias`);
                port.write( contaChar(linha1, linha2));
            }
            cont++;
            break;
        }
        case 9:{
            //port.write(`Hora: ${hora()}  Data: ${data()}`);
            linha1 = (`Hora: ${hora()}`);
            linha2 = (`Data: ${data()}`);
            port.write( contaChar(linha1, linha2));
            cont=0;            
            break;
        }
       
    }
      
}


//index((process.argv[2]));

