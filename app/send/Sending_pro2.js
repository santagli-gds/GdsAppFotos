

import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Alert,
  TouchableOpacity,
  ScrollView,

} from 'react-native';

//import Entypo from 'react-native-vector-icons/Entypo';
import * as Progress from 'react-native-progress';
import RNFS from 'react-native-fs';


export default class Sending extends Component {
  constructor(props){
    super(props)
    this.state = {  
      estado_envio: true,
      titulo_envio: 'Envio de Sala', 
      subtitulo_envio: 'Preparado para enviar...',
      estado_actividad: false,
      Fotos: [],
      progress: 0,
      volver: false,
      usuario: '',
      detalle: '',
      exito: false,
      FotosSala: [],
      sala: '',
    }
  }

  async componentDidMount(){

  await this.Sending()



   // await this.animate();
   }


  funcion_volver(){

if (this.state.volver)
{
    return(
      <TouchableOpacity onPress={()=>this.props.navigation.navigate("ISala")} style={{ padding:20, backgroundColor:'#fff', fontSize: 30}}  >
        <Text style={{  color:'#567', fontSize: 30}}>Volver</Text>
      </TouchableOpacity>
    )
   }
}

async Sending(){

  const id_sala = await this.props.navigation.state.params.id_sala;
  this.setState({ sala: id_sala });

  let nameStorage = await 'gdsFotos' + id_sala;
  let jsonName = await AsyncStorage.getItem(nameStorage);
  let newFotos = await JSON.parse(jsonName); 
  this.setState({ FotosSala: newFotos });

  
  const UsernameStorage = await 'usuarios'   
  let json = await AsyncStorage.getItem(UsernameStorage);
  let newLogin= await JSON.parse(json);  
  if (!Array.isArray(newLogin) || !newLogin.length)    
  {

  }
  else{
    this.setState({ 
      usuario: newLogin[0].Usuario_Id ,          
    })
  }


  const array = await this.state.FotosSala;
  await this.funcEnviaArray(array, id_sala)
  await this.setState({ progress: 1,  volver: true});


  if (await this.state.exito){
  await this.Limpiar(id_sala);
  await  Alert.alert("Imagenes enviadas Exitosamente!!", ";D", "Sala " + id_sala )
  }
  else {
    await Alert.alert("Ohh!!", "Favor intente nuevamente faltaron algunas por enviar :(")
  }

  
}




async funcEnviaArray(array, id_sala){

  try{

  var results = await Promise.all(array.map(async (item) => {
       var respuesta =  await this.funcion_enviar(item, id_sala)
      return  respuesta;
  }));


  //await Alert.alert("Termino", JSON.stringify(results))

} catch (error) {
  await Alert.alert("Error en Envio", error.message)

  
}

}



async funcion_enviar (item, id_sala){

  

 
  this.setState({ indeterminate: false });
  this.setState({ progress: 0.0 });
  var NewFotosSala = await this.state.FotosSala;
   
      var id_tarea = await item.id_tarea;
      var desc_categoria = await item.desc_categoria;
      var id_usuario = await this.state.usuario;
      var newData = await NewFotosSala.filter(function(items){
        return items.uri != item.uri
    
     })
     

      //Alert.alert("datos","nombre: " + nombre + " id_tarea: " + id_tarea + "desc_categoria: " + desc_categoria + " id_sala: " + id_sala + " id_usuario:" + id_usuario )
      const data = await new FormData();
      //var filename =  newFotos[i].descSala + '.jpg';
      var filename =   await  item.fecha + '.jpg';
      var uri = await item.uri;
       await data.append("archivo",{uri: uri,type: "image/jpg",name: "archivo"});
        var  responseDatas =    await  fetch('http://traolcl.gdsnet.com:8500/api/FotosPro/post_GuardaFotos', {
              method: 'POST',
              headers: {            
                filename: filename,
                id_usuario: id_usuario,
                id_sala: id_sala,
                id_tarea:  id_tarea,  
                desc_categoria: desc_categoria,   
              },
              body:  data,
            }).then((response) => response.json())
            .then((responseData) => {

              return  responseData
              //Alert.alert("Respuesta de API", responseData);

            })  
            
         await   this.funexito(responseDatas, uri, filename, newData, id_sala)



 }

 async funexito(responseData, uri, filename, newData, id_sala){

  //Alert.alert(responseData)
  var nameStorage = await 'gdsFotos' + id_sala  
  
  if (responseData=='OK'){
        
  await   RNFS.unlink(uri)
    var detalles= await this.state.detalle + "Foto: " + filename + " estado: OK \n"
    await  this.setState({ FotosSala: newData });
    await AsyncStorage.setItem(nameStorage,  JSON.stringify(newData));
    this.setState({ exito: true });
  
  }
  else if (responseData=='0 filas'){
    await  RNFS.unlink(uri)
    await  this.setState({ FotosSala: newData });
    var detalles= await this.state.detalle + "Foto: " + filename + " estado: ok \n"
    await AsyncStorage.setItem(nameStorage,  JSON.stringify(newData));
    this.setState({ exito: true });
  
  }
  else {
    Alert.alert("Problema en Conexion :(", "favor vuelva a intentarlo, revise su conexion :D")
    this.setState({ exito: false });
  
  }

  await this.setState({
    detalle: detalles
  })
 }
 

 Limpiar(id_sala){

  try {
    var nameStorage =  'gdsFotos' + id_sala   
    AsyncStorage.removeItem(nameStorage);
  
    
  } catch (error) {

    Alert.alert("Error de Envio 3", error.message);
    var detalles= "Error : " + error.message
    this.setState({
      detalle: detalles
    })
  }


}



  render(){
    var id_sala = this.props.navigation.state.params.id_sala
    var descSala = this.props.navigation.state.params.descSala

    
    return(
      <View style={styles.container}>      
          
         
          <View style={{flexDirection: 'row', backgroundColor: '#283747', padding:10}}> 
            
       
          <View style={{flex: 4, alignItems: 'center'}}>
            <Text  style={{  color:'#fff', fontSize: 20}}>Enviando...{descSala}</Text>
          </View>
          </View>

<View style={{flexDirection: 'column', flex: 1, alignItems: 'center', backgroundColor: '#283747', padding:10}}> 
 

  <Text  style={{  color:'#fff', fontSize: 20}}>ID SALA: {id_sala}</Text>
 <Progress.Circle
            style={styles.progress}
            size={100}
            progress={this.state.progress}
            indeterminate={this.state.indeterminate}
            direction="counter-clockwise"
            showsText={true}
            thickness={10}
          />


         {this.funcion_volver()}
          <ScrollView>
         <Text style={{color: '#aaa'}}>{this.state.detalle}</Text>
         </ScrollView>
 </View>


          



      </View>
    );
  }
 
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
    },
  view_boton: {
    flex: 1,     
    marginHorizontal: 15,
    margin: 5,
    flexDirection: 'column',  
    backgroundColor: '#FFF',       
    },
  view_title: {       
    flex: 1,  
    backgroundColor: '#5DADE2',           
    borderTopLeftRadius: 5,        
    borderTopRightRadius: 5,   
    padding: 5,    
    flexDirection: 'column',  
    },
    view_titlePreguntas: {       
      flex: 1, 
      flexDirection: 'column',  
      backgroundColor: '#E67E22',           
      borderTopLeftRadius: 5,        
      borderTopRightRadius: 5,   
      padding: 5,     
      },
    view_subtitle: {       
      flex: 2, 
      flexDirection: 'row',  
      backgroundColor: '#E5E8E8',           
      borderBottomLeftRadius: 5,        
      borderBottomRightRadius: 5,        
      padding: 10,  
      },
    text: {      
      fontSize: 20,      
      color:  "#fff"
     },
     subtextporcentaje: {
      fontSize: 30, 
     },

     title: {
      fontSize: 40,
      textAlign: 'center'  ,
      color:  "#fff"
     },
     view_enviar: {
      flex: 0.5, 
      flexDirection: 'column',  
      backgroundColor: '#DC7633',           
      borderTopLeftRadius: 5,        
      borderTopRightRadius: 5,   
      padding: 5,   
     },
     subtext: {      
      fontSize: 14,      
      color:  "#717D7E",
     },
     separador: {
       fontSize: 50
     },    
     view_subtitle_presencia: {flex: 1, alignItems: 'center'},
     view_subtitle_precio: {flex: 1,  alignItems: 'center'},
     shadowSave: {
      shadowColor: 'black',
      shadowOpacity: 0.5,
      shadowRadius: 5,
      shadowOffset: {
        width: 2,
        height: 2,}
      
    },
    BotonEnviar:{

      backgroundColor: '#5D6D7E',
      padding: 50,
      borderRadius: 10,
      margin: 10,
      alignItems: 'center',
      shadowColor: 'black',
      shadowOpacity: 0.5,
      shadowRadius: 10,
      shadowOffset: {
        width: 2,
        height: 2,}
      },
        welcome: {
          fontSize: 20,
          textAlign: 'center',
          margin: 10,
        },
        circles: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        progress: {
          margin: 10,

        },





});


