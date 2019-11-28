import {get, post, put, del} from './requster.js';
(() => {

    const partials = {
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs'
    };
    const app = Sammy('#main', function(){
        this.use('Handlebars', 'hbs');

        this.get('#/', loadHome);
        this.get('#/home', loadHome);


        this.get('#/about', function(ctx){
            this.loadPartials(partials)
            .then(function(){
                this.partial('./templates/about/about.hbs');
            })
        })

        this.get('#/login', function(ctx){
            partials['loginForm'] = './templates/login/loginForm.hbs';
            this.loadPartials(partials)
            .then(function(){
                this.partial('./templates/login/loginPage.hbs');
            })
        })

        this.post('#/login', function(ctx){
            const {username, password} = ctx.params;

            post('user', 'login', {username, password}, 'Basic')
            .then(userInfo => {
                sessionStorage.setItem('authtoken', userInfo._kmd.authtoken);
                sessionStorage.setItem('username', userInfo.username);
                ctx.redirect('#/');
            })
            .catch(console.error)
        })

        this.get('#/register', function(ctx){
            partials['registerForm'] = './templates/register/registerForm.hbs';
            this.loadPartials(partials)
            .then(function(){
                this.partial('./templates/register/registerPage.hbs');
            })
        })

        this.post('#/register',  function(ctx){
            const {username, password, repeatPassword} = ctx.params;

            post('user', '', {username, password}, 'Basic')
            .then(data => {
                console.log(data);
                ctx.redirect('#/login')
            })
            .catch(console.error);
        })

        this.get('#/catalog', function(ctx){
            partials['team'] = './templates/catalog/team.hbs';

            get('appdata', 'teams', 'Kinvey')
            .then((data) => {
                ctx.teams = data;

                this.loadPartials(partials)
                    .then(function(){
                        this.partial('./templates/catalog/teamCatalog.hbs');
                    })
            })
            .catch(console.error)
        })

        this.get('#/catalog/:teamId', function(ctx){
            const id = ctx.params.teamId;
            partials['teamMember'] = './templates/catalog/teamMember.hbs';
            partials['teamControls'] = './templates/catalog/teamControls.hbs';

            get('appdata', `teams/${id}`, 'Kinvey')
                .then(data => {
                    ctx.name = data.name;
                    ctx.comment = data.comment;

                    this.loadPartials(partials)
                        .then(function(){
                            this.partial('./templates/catalog/details.hbs')
                        })
                })
                .catch(console.error);

        })

        this.get('#/create', function(ctx){
            partials['createForm'] = './templates/create/createForm.hbs';

            this.loadPartials(partials)
                .then(function(){
                    this.partial('./templates/create/createPage.hbs')
                })
        })

        this.post('#/create', function(ctx){
            const {name, comment} = ctx.params;

            post('appdata', 'teams', {name, comment}, 'Kinvey')
                .then((data) => {
                    ctx.redirect('#/catalog');
                })
                .catch(console.error);
        })

        this.get('#/logout', function(ctx){
            sessionStorage.clear();
            ctx.redirect('#/');
        })

        function loadHome(ctx){
            getSessionInfo(ctx);

            this.loadPartials(partials)
            .then(function(){
                this.partial('./templates/home/home.hbs')});
        }
    });

    function getSessionInfo(ctx){
        ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
        ctx.username = sessionStorage.getItem('username');
    }

    app.run();
})()
