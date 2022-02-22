import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from "./users.model";
import { InjectModel } from "@nestjs/sequelize";
import { CreateUserDto } from "./dto/create-user.dto";
import { RolesService } from "../roles/roles.service";
import { AddRoleDto } from "./dto/add-role.dto";
import { BanUserDto } from "./dto/ban-user.dto";
import { UserRoles } from "../roles/user-roles.model";

import { Role } from "../roles/roles.model";

@Injectable()
export class UsersService {

    // внедряем модель используя конструктор
    constructor(@InjectModel(User) private userRepository: typeof User,
        private roleService: RolesService) { }

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        const role = await this.roleService.getRoleByValue("ADMIN")
        // await user.$set('roles', [role.id])
        // user.roles = [role]
        // console.log(user)
        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email }, include: { all: true } })
        return user;
    }

    async addRole(dto: AddRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);
        if (role && user) {
            await user.$add('role', role.id);
            return dto;
        }
        throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    }

    async ban(dto: BanUserDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
        user.banned = true;
        user.banReason = dto.banReason;
        await user.save();
        return user;
    }
    // const roles = users.map(user => {
    //     return user.roles;
    // })
    // .reduce((previus, next) => previus.concat(next), [])
    // .map(role => {
    //     return role.value;
    // });
    // users.forEach(user =>{
    //     user.setDataValue('roles', user.roles.map(role => {
    //         return (user)
    //     }));
    // });

    // const rolesAsObject = users.map(function(p){
    //     return Object.keys(p).map(function(k){return p[k]}
    //   ).join("");})
    // console.log(users.map(user => user.roles))

    async getAllUsers() {
        const users = await this.userRepository.findAll({
            include: {
                model: Role,
                attributes: ['value'],
                through: {
                    attributes: []
                }
            },
        });

        // console.log(users, "<<<<<<1") 
        // console.log(users.map(user => JSON.stringify(user.roles.flatMap(({value}) => [value]))))
        let newRole = users.map(user => JSON.stringify(user.roles)).map(function (p) {
            return Object.keys(p).map(function (k) { return p[k] }
            ).join('').replace(/\[|\]/g, '').replace(/['"]+/g, '').replace(/[{}]/g, "")
        })

        // let data = JSON.parse(newLog);
        // let newArr = JSON.stringify(newLog).replace(/'([^']+)':/g, '$1:')


        let newLog = JSON.stringify(users.map(item => item))
        // let objID = newLog.findIndex(obj => obj.roles === "roles")
        let newR = JSON.stringify(users.findIndex(item => item.roles === "roles"))
        
        console.log(newLog, "newLog")
        console.log(newR, "newR")
        // console.log(newArr, "newArr")


        // console.log(users.map(user => JSON.stringify(user.roles)).map(us => JSON.parse(us)))
        // console.log(users.map(function(p){
        //     return Object.keys(p).map(function(k){return p[k]}
        //   );})), "<<<<<<2"

        // console.log(users.map(user => user.roles), "<<<<<<3")

        return newLog;

    }
}


// var projects = [
//     {
//         value: "jquery",
//         label: "jQuery",
//         desc: "the write less, do more, JavaScript library",
//         icon: "jquery_32x32.png"
//     },
//     {
//         value: "jquery-ui",
//         label: "jQuery UI",
//         desc: "the official user interface library for jQuery",
//         icon: "jqueryui_32x32.png"
//     }];
    
//     //find the index of object from array that you want to update
//     const objIndex = projects.findIndex(obj => obj.value === 'jquery-ui');
    
//     // make new object of updated object.   
//     const updatedObj = { ...projects[objIndex], desc: 'updated desc value'};
    
//     // make final new array of objects by combining updated object.
//     const updatedProjects = [
//       ...projects.slice(0, objIndex),
//       updatedObj,
//       ...projects.slice(objIndex + 1),
//     ];
    
//     console.log("original data=", projects);
//     console.log("updated data=", updatedProjects);