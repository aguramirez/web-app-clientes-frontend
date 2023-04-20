import { Component, Input} from '@angular/core';
import {Cliente} from '../cliente';
import {ClienteService} from '../cliente.service';
import swal from 'sweetalert2';
import {HttpEventType} from '@angular/common/http';
import {ModalService} from './modal.service';
import {AuthService} from '../../usuarios/auth.service';
import {FacturaService} from '../../facturas/services/factura.service';
import {Factura} from '../../facturas/models/factura';

@Component({
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent{
  @Input() cliente: Cliente = new Cliente();
  titulo: String = "Detalle del cliente";
  //@ts-ignore
  private fotoSeleccionada: File ;
  progreso: number =0;

  constructor(private clienteService: ClienteService,
    private facturaService: FacturaService,
    public authService: AuthService,
    public modalService: ModalService){

  }

  ngOnInit(){
  }

  seleccionarFoto(event: any){
    this.fotoSeleccionada = event.target.files[0];
    this.progreso = 0;
    console.log(this.fotoSeleccionada);
    if(this.fotoSeleccionada.type.indexOf('image')<0){
      swal.fire('Error seleccionar imagen: ', 'el archivo debe ser del tipo imagen', 'error');
      //@ts-ignore
      this.fotoSeleccionada = null;
    }
  }

  subirFoto(){
    if(!this.fotoSeleccionada){
      swal.fire('Error Upload: ', ' debe seleccionar una foto', 'error');
    }else{
    this.clienteService.subirFoto(this.fotoSeleccionada, this.cliente.id).subscribe(
      event => {
        if(event.type === HttpEventType.UploadProgress){
          //@ts-ignore
          this.progreso = Math.round((event.loaded/event.total)*100);
        }else if(event.type === HttpEventType.Response){
          let response: any = event.body;
          this.cliente = response.cliente as Cliente;

          this.modalService.notificarUpload.emit(this.cliente);
          swal.fire('La foto se ha subido completamente!', response.mensaje, 'success')
        }
      }
    );
  }
  }

  cerrarModal(){
    this.modalService.cerrarModal();
    //@ts-ignore
    this.fotoSeleccionada = null;
    this.progreso =0;
  }

  delete(factura: Factura): void{
    const swalWithBootstrapButtons = swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false
})

swalWithBootstrapButtons.fire({
  title: 'Esta seguro?',
  text: `Seguro que desea eliminar la factura ${factura.descripcion}?`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Si, eliminar!',
  cancelButtonText: 'No, cancelar!',
  reverseButtons: true
}).then((result) => {
  if (result.isConfirmed) {

    this.facturaService.delete(factura.id).subscribe(
      response => {

        this.cliente.facturas = this.cliente.facturas.filter(f => f !== factura)

        swalWithBootstrapButtons.fire(
          'Facura Eliminado!',
          `Factura ${factura.descripcion} eliminada con exito.`,
          'success'
        )
      }
    )
  }
})
  }
}
