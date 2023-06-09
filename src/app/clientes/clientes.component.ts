import { Component } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import swal from 'sweetalert2'
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import {ModalService} from './detalle/modal.service';
import {AuthService} from '../usuarios/auth.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html'
})
export class ClientesComponent {
  clientes: Cliente[] = [];
  paginador: any;
  //@ts-ignore
  clienteSeleccionado: Cliente;

  constructor(private clienteService: ClienteService,
    public modalService: ModalService,
    public authService: AuthService,
    private activatedRoute: ActivatedRoute){ }

  ngOnInit(){
    this.activatedRoute.paramMap.subscribe( params => {
    let page: any = params.get('page');

    if(!page){
      page = 0;
    }

    this.clienteService.getClientes(page)
    .pipe(
      tap(response => {
        console.log('ClientesComponent: tap 3');
        (response.content as Cliente[]).forEach(cliente => {
          console.log(cliente.nombre);
        });
      })
    ).subscribe(response => {
      this.clientes = response.content as Cliente[]
      this.paginador = response;
    });
   });

   this.modalService.notificarUpload.subscribe(cliente => {
     this.clientes = this.clientes.map(clienteOriginal =>{
       if(cliente.id == clienteOriginal.id){
         clienteOriginal.foto = cliente.foto;
       }
       return clienteOriginal;
     })
   })
  }


  delete(cliente: Cliente): void {
    const swalWithBootstrapButtons = swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false
})

swalWithBootstrapButtons.fire({
  title: 'Esta seguro?',
  text: `Seguro que desea eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Si, eliminar!',
  cancelButtonText: 'No, cancelar!',
  reverseButtons: true
}).then((result) => {
  if (result.isConfirmed) {

    this.clienteService.delete(cliente.id).subscribe(
      response => {

        this.clientes = this.clientes.filter(cli => cli !== cliente)

        swalWithBootstrapButtons.fire(
          'Cliente Eliminado!',
          `Cliente ${cliente.nombre} ${cliente.apellido} eliminado con exito.`,
          'success'
        )
      }
    )
  }
})
  }

  abrirModal(cliente: Cliente){
    this.clienteSeleccionado = cliente;
    this.modalService.abrirModal();
  }
}
